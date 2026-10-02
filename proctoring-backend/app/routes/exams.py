from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Exam, Question, User
from ..schemas import ExamCreate
from .auth import get_current_user, require_admin


router = APIRouter(
    prefix="/exams",
    tags=["Exams"]
)


UPLOAD_DIR = (
    Path(__file__).resolve().parent.parent
    / "uploads"
    / "questions"
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


MAX_IMAGE_SIZE = 5 * 1024 * 1024


@router.post("/upload-image")
async def upload_question_image(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
):
    if (
        not file.content_type
        or file.content_type not in ALLOWED_IMAGE_TYPES
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG, WEBP and GIF "
                "images are allowed"
            )
        )

    content = await file.read()

    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5 MB"
        )

    extension = Path(
        file.filename or "image"
    ).suffix.lower()

    if extension not in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
    }:
        extension = ".png"

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    filename = (
        f"{uuid4().hex}{extension}"
    )

    file_path = UPLOAD_DIR / filename

    file_path.write_bytes(content)

    return {
        "image_url":
            f"/uploads/questions/{filename}"
    }


@router.post("/")
def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    if not exam_data.questions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Exam must contain at least "
                "one question"
            )
        )

    total_marks = sum(
        question.marks
        for question in exam_data.questions
    )

    exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        duration=exam_data.duration,
        total_marks=total_marks,
        published=False,
        organization_id=admin.organization_id
    )

    db.add(exam)
    db.flush()

    for question in exam_data.questions:

        if len(question.options) != 4:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Each question must have "
                    "exactly 4 options"
                )
            )

        if (
            question.correct < 0
            or question.correct > 3
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Correct option must be "
                    "between 0 and 3"
                )
            )

        if (
            not question.text.strip()
            and not question.image_url
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Each question must contain "
                    "text or an image"
                )
            )

        db_question = Question(
            exam_id=exam.id,
            question_text=question.text,
            image_url=question.image_url,
            option_a=question.options[0],
            option_b=question.options[1],
            option_c=question.options[2],
            option_d=question.options[3],
            correct_option=question.correct,
            marks=question.marks
        )

        db.add(db_question)

    db.commit()
    db.refresh(exam)

    return {
        "id": exam.id,
        "title": exam.title,
        "duration": exam.duration,
        "total_marks": exam.total_marks,
        "published": exam.published,
        "message": (
            "Exam created successfully"
        )
    }


@router.get("/")
def get_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    query = db.query(Exam).filter(
        Exam.organization_id
        == current_user.organization_id
    )

    if current_user.role == "student":
        query = query.filter(
            Exam.published == True
        )

    exams = query.order_by(
        Exam.created_at.desc()
    ).all()

    return [
        {
            "id": exam.id,
            "title": exam.title,
            "description": exam.description,
            "duration": exam.duration,
            "total_marks": exam.total_marks,
            "published": exam.published
        }
        for exam in exams
    ]


@router.get("/{exam_id}")
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.organization_id
        == current_user.organization_id
    ).first()

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    if (
        current_user.role == "student"
        and not exam.published
    ):
        raise HTTPException(
            status_code=403,
            detail="Exam is not published"
        )

    questions = []

    for question in exam.questions:

        questions.append({
            "id": question.id,

            "text": (
                question.question_text
            ),

            "image_url": (
                question.image_url
            ),

            "options": [
                question.option_a,
                question.option_b,
                question.option_c,
                question.option_d
            ],

            "marks": question.marks
        })

    return {
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "duration": exam.duration,
        "total_marks": exam.total_marks,
        "published": exam.published,
        "questions": questions
    }


@router.post("/{exam_id}/publish")
def publish_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.organization_id
        == admin.organization_id
    ).first()

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    exam.published = True

    db.commit()

    return {
        "message": (
            "Exam published successfully"
        ),
        "exam_id": exam.id
    }