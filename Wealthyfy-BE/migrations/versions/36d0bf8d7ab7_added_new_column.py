"""added new column

Revision ID: 36d0bf8d7ab7
Revises: acccb497fc48
Create Date: 2025-11-11 10:25:08.427013
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '36d0bf8d7ab7'
down_revision: Union[str, Sequence[str], None] = 'acccb497fc48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 1. Create Enum type if not exists
    consent_enum = postgresql.ENUM('YES', 'NO', name='consent_enum')
    consent_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add column using the enum
    op.add_column(
        'pancard',
        sa.Column(
            'consent',
            consent_enum,
            nullable=False,
            server_default='NO'   # ensures old rows do not break
        )
    )

    op.create_index(op.f('ix_pancard_consent'), 'pancard', ['consent'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f('ix_pancard_consent'), table_name='pancard')
    op.drop_column('pancard', 'consent')

    # Drop Enum type
    consent_enum = postgresql.ENUM('YES', 'NO', name='consent_enum')
    consent_enum.drop(op.get_bind(), checkfirst=True)
