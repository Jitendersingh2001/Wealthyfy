"""add new status column

Revision ID: 3474fcc9cf80
Revises: e16c327e8b39
Create Date: 2025-11-17 15:58:10.656846

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3474fcc9cf80'
down_revision: Union[str, Sequence[str], None] = 'e16c327e8b39'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ENUM_NAME = "consent_fi_type_status_enum"
STATUS_VALUES = ('ACTIVE', 'EXPIRE')


def upgrade() -> None:
    """Upgrade schema."""
    # Create the enum type explicitly
    status_enum = postgresql.ENUM(*STATUS_VALUES, name=ENUM_NAME)
    status_enum.create(op.get_bind(), checkfirst=True)

    # Add the new column using the enum type
    op.add_column(
        'consent_fi_type',
        sa.Column(
            'status',
            sa.Enum(*STATUS_VALUES, name=ENUM_NAME),
            nullable=False,
            server_default=STATUS_VALUES[0]  # Default to 'ACTIVE' for existing rows
        )
    )

    # Create the index
    op.create_index(
        op.f('ix_consent_fi_type_status'),
        'consent_fi_type',
        ['status'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_consent_fi_type_status'), table_name='consent_fi_type')
    op.drop_column('consent_fi_type', 'status')

    # Drop enum type after column has been removed
    status_enum = postgresql.ENUM(*STATUS_VALUES, name=ENUM_NAME)
    status_enum.drop(op.get_bind(), checkfirst=True)
