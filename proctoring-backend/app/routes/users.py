from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from .auth import require_admin


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/admin/students")
def get_admin_students(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    students = (
        db.query(User)
        .filter(
            User.organization_id == admin.organization_id,
            User.role == "student"
        )
        .order_by(User.id.desc())
        .all()
    )

    result = []

    for student in students:
        result.append(
            {
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "role": student.role,
                "status": getattr(
                    student,
                    "status",
                    "active"
                ),
                "organization_name": (
                    student.organization.name
                    if getattr(
                        student,
                        "organization",
                        None
                    )
                    else "-"
                ),
                "created_at": (
                    student.created_at.isoformat()
                    if getattr(
                        student,
                        "created_at",
                        None
                    )
                    else None
                ),
            }
        )

    return result