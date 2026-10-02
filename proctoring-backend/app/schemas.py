from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class QuestionCreate(BaseModel):
    text: str
    image_url: Optional[str] = None
    options: List[str]
    correct: int
    marks: float = 1


class QuestionResponse(BaseModel):
    id: int
    text: str
    image_url: Optional[str] = None
    options: List[str]
    marks: float

    model_config = ConfigDict(
        from_attributes=True
    )


class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    duration: int
    questions: List[QuestionCreate]


class ExamResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    duration: int
    total_marks: float
    published: bool
    questions: List[QuestionResponse]

    model_config = ConfigDict(
        from_attributes=True
    )


class AttemptCreate(BaseModel):
    exam_id: int


class AnswerCreate(BaseModel):
    question_id: int
    selected_option: Optional[int] = None


class ProctoringEventCreate(BaseModel):
    event_type: str
    event_data: Optional[str] = None


class AttemptResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    organization_id: int
    status: str
    score: float
    started_at: datetime
    submitted_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )