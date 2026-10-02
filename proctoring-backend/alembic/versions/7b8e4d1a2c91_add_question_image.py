"""add image url to questions

Revision ID: 7b8e4d1a2c91
Revises: 5f6199efbf04
"""

from alembic import op
import sqlalchemy as sa


revision = "7b8e4d1a2c91"

down_revision = "5f6199efbf04"

branch_labels = None

depends_on = None


def upgrade():
    op.add_column(
        "questions",
        sa.Column(
            "image_url",
            sa.Text(),
            nullable=True
        ),
    )


def downgrade():
    op.drop_column(
        "questions",
        "image_url"
    )