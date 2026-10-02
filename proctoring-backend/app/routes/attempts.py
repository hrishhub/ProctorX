from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Answer,
    Attempt,
    Exam,
    Question,
    ProctoringEvent,
    User,
)
from ..schemas import (
    AnswerCreate,
    AttemptCreate,
    AttemptResponse,
    ProctoringEventCreate,
)
from .auth import get_current_user, require_admin


router = APIRouter(
    prefix="/attempts",
    tags=["Attempts"]
)


def get_attempt(
    attempt_id: int,
    current_user: User,
    db: Session
):
    attempt = (
        db.query(Attempt)
        .filter(
            Attempt.id == attempt_id,
            Attempt.student_id == current_user.id,
            Attempt.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=404,
            detail="Attempt not found"
        )

    return attempt


@router.get("/admin")
def get_admin_attempts(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    attempts = (
        db.query(Attempt)
        .join(User, Attempt.student_id == User.id)
        .join(Exam, Attempt.exam_id == Exam.id)
        .filter(
            Attempt.organization_id == admin.organization_id
        )
        .order_by(
            Attempt.started_at.desc()
        )
        .limit(100)
        .all()
    )

    result = []

    for attempt in attempts:
        violation_count = len(attempt.events)
        answered_count = len(attempt.answers)

        total_marks = attempt.exam.total_marks or 0

        percentage = 0

        if total_marks > 0:
            percentage = round(
                (attempt.score / total_marks) * 100,
                2
            )

        result.append(
            {
                "id": attempt.id,
                "student_id": attempt.student_id,
                "student_name": attempt.student.name,
                "student_email": attempt.student.email,
                "exam_id": attempt.exam_id,
                "exam_title": attempt.exam.title,
                "status": attempt.status,
                "score": attempt.score,
                "total_marks": total_marks,
                "percentage": percentage,
                "answered_count": answered_count,
                "question_count": len(attempt.exam.questions),
                "violation_count": violation_count,
                "started_at": (
                    attempt.started_at.isoformat()
                    if attempt.started_at
                    else None
                ),
                "submitted_at": (
                    attempt.submitted_at.isoformat()
                    if attempt.submitted_at
                    else None
                ),
            }
        )

    return result


@router.get("/admin/events")
def get_admin_events(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    events = (
        db.query(ProctoringEvent)
        .join(Attempt)
        .filter(
            Attempt.organization_id == admin.organization_id
        )
        .order_by(
            ProctoringEvent.timestamp.desc()
        )
        .limit(100)
        .all()
    )

    return [
        {
            "id": event.id,
            "attempt_id": event.attempt_id,
            "student_name": event.attempt.student.name,
            "student_email": event.attempt.student.email,
            "event_type": event.event_type,
            "event_data": event.event_data,
            "timestamp": event.timestamp.isoformat(),
        }
        for event in events
    ]


def get_expiry_time(attempt: Attempt):
    started_at = attempt.started_at

    if started_at.tzinfo is None:
        started_at = started_at.replace(
            tzinfo=timezone.utc
        )

    return (
        started_at
        + timedelta(
            minutes=attempt.exam.duration
        )
    )


def check_attempt_active(
    attempt: Attempt,
    db: Session
):
    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail="Attempt is not active"
        )

    now = datetime.now(timezone.utc)

    expires_at = get_expiry_time(attempt)

    if now >= expires_at:
        attempt.status = "expired"
        attempt.submitted_at = datetime.utcnow()

        db.commit()
        db.refresh(attempt)

        raise HTTPException(
            status_code=400,
            detail="Attempt has expired"
        )

    return expires_at


@router.post(
    "/",
    response_model=AttemptResponse
)
def start_attempt(
    data: AttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    exam = (
        db.query(Exam)
        .filter(
            Exam.id == data.exam_id,
            Exam.organization_id == current_user.organization_id,
            Exam.published == True,
        )
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Published exam not found"
        )

    existing = (
        db.query(Attempt)
        .filter(
            Attempt.student_id == current_user.id,
            Attempt.exam_id == exam.id,
            Attempt.organization_id == current_user.organization_id,
            Attempt.status == "in_progress",
        )
        .first()
    )

    if existing:
        now = datetime.now(timezone.utc)

        started_at = existing.started_at

        if started_at.tzinfo is None:
            started_at = started_at.replace(
                tzinfo=timezone.utc
            )

        expires_at = (
            started_at
            + timedelta(
                minutes=exam.duration
            )
        )

        if now < expires_at:
            return existing

        existing.status = "expired"
        existing.submitted_at = datetime.utcnow()

        db.commit()
        db.refresh(existing)

    now = datetime.utcnow()

    attempt = Attempt(
        student_id=current_user.id,
        exam_id=exam.id,
        organization_id=current_user.organization_id,
        status="in_progress",
        score=0,
        started_at=now,
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt


@router.get(
    "/{attempt_id}",
    response_model=AttemptResponse
)
def get_attempt_details(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = get_attempt(
        attempt_id,
        current_user,
        db
    )

    if attempt.status == "in_progress":
        try:
            check_attempt_active(
                attempt,
                db
            )
        except HTTPException:
            db.refresh(attempt)

    return attempt


@router.post(
    "/{attempt_id}/answers"
)
def save_answer(
    attempt_id: int,
    data: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = get_attempt(
        attempt_id,
        current_user,
        db
    )

    check_attempt_active(
        attempt,
        db
    )

    question = (
        db.query(Question)
        .filter(
            Question.id == data.question_id,
            Question.exam_id == attempt.exam_id,
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    if (
        data.selected_option < 0
        or data.selected_option > 3
    ):
        raise HTTPException(
            status_code=400,
            detail="Selected option must be between 0 and 3"
        )

    answer = (
        db.query(Answer)
        .filter(
            Answer.attempt_id == attempt.id,
            Answer.question_id == question.id,
        )
        .first()
    )

    if answer:
        answer.selected_option = data.selected_option
    else:
        answer = Answer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option=data.selected_option,
        )

        db.add(answer)

    db.commit()

    return {
        "message": "Answer saved",
        "attempt_id": attempt.id,
        "question_id": question.id,
    }


@router.post(
    "/{attempt_id}/events"
)
def add_proctoring_event(
    attempt_id: int,
    data: ProctoringEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = get_attempt(
        attempt_id,
        current_user,
        db
    )

    if attempt.status not in [
        "in_progress",
        "submitted",
        "expired"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid attempt status"
        )

    event = ProctoringEvent(
        attempt_id=attempt.id,
        event_type=data.event_type,
        event_data=data.event_data,
        timestamp=datetime.utcnow(),
    )

    db.add(event)
    db.commit()

    return {
        "message": "Event recorded",
        "event_id": event.id,
    }


@router.post(
    "/{attempt_id}/submit",
    response_model=AttemptResponse
)
def submit_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = get_attempt(
        attempt_id,
        current_user,
        db
    )

    if attempt.status == "submitted":
        return attempt

    if attempt.status == "expired":
        return attempt

    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail="Attempt cannot be submitted"
        )

    check_attempt_active(
        attempt,
        db
    )

    score = 0

    for answer in attempt.answers:
        question = (
            db.query(Question)
            .filter(
                Question.id == answer.question_id,
                Question.exam_id == attempt.exam_id,
            )
            .first()
        )

        if not question:
            continue

        if answer.selected_option == question.correct_option:
            score += question.marks

    attempt.score = score
    attempt.status = "submitted"
    attempt.submitted_at = datetime.utcnow()

    db.commit()
    db.refresh(attempt)

    return attempt