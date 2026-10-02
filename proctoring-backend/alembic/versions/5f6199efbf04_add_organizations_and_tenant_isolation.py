"""add organizations and tenant isolation

Revision ID: 5f6199efbf04
Revises:
Create Date: 2026-10-02 00:27:14.159372

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5f6199efbf04"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "organizations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_organizations_id",
        "organizations",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_organizations_slug",
        "organizations",
        ["slug"],
        unique=True,
    )

    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            INSERT INTO organizations (name, slug, created_at)
            VALUES (:name, :slug, NOW())
            """
        ),
        {
            "name": "Default Organization",
            "slug": "default",
        },
    )

    organization_id = connection.execute(
        sa.text(
            """
            SELECT id
            FROM organizations
            WHERE slug = 'default'
            """
        )
    ).scalar_one()

    op.add_column(
        "users",
        sa.Column(
            "organization_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    connection.execute(
        sa.text(
            """
            UPDATE users
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.alter_column(
        "users",
        "organization_id",
        nullable=False,
    )

    op.create_index(
        "ix_users_organization_id",
        "users",
        ["organization_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_users_organization_id",
        "users",
        "organizations",
        ["organization_id"],
        ["id"],
    )

    op.add_column(
        "exams",
        sa.Column(
            "organization_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    connection.execute(
        sa.text(
            """
            UPDATE exams
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.alter_column(
        "exams",
        "organization_id",
        nullable=False,
    )

    op.create_index(
        "ix_exams_organization_id",
        "exams",
        ["organization_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_exams_organization_id",
        "exams",
        "organizations",
        ["organization_id"],
        ["id"],
    )

    op.add_column(
        "attempts",
        sa.Column(
            "organization_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    connection.execute(
        sa.text(
            """
            UPDATE attempts
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.alter_column(
        "attempts",
        "organization_id",
        nullable=False,
    )

    op.create_index(
        "ix_attempts_organization_id",
        "attempts",
        ["organization_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_attempts_organization_id",
        "attempts",
        "organizations",
        ["organization_id"],
        ["id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_attempts_organization_id",
        "attempts",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_attempts_organization_id",
        table_name="attempts",
    )

    op.drop_column(
        "attempts",
        "organization_id",
    )

    op.drop_constraint(
        "fk_exams_organization_id",
        "exams",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_exams_organization_id",
        table_name="exams",
    )

    op.drop_column(
        "exams",
        "organization_id",
    )

    op.drop_constraint(
        "fk_users_organization_id",
        "users",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_users_organization_id",
        table_name="users",
    )

    op.drop_column(
        "users",
        "organization_id",
    )

    op.drop_index(
        "ix_organizations_slug",
        table_name="organizations",
    )

    op.drop_index(
        "ix_organizations_id",
        table_name="organizations",
    )

    op.drop_table("organizations")