"""
Alembic command line interface
 -> alembic upgrade head
 -> alembic revision --autogenerate -m "name to describe the changes"
 -> alembic upgrade head # to apply the latest migration
 -> alembic downgrade -1 # to revert the last migration
 -> alembic history # to see the history of migrations
 -> alembic current # to see the current migration version
 -> alembic upgrade <Revision ID> # to upgrade to a specific migration
"""

""" Uvicorn command line interface
 -> uvicorn main:app --reload # to run the server
"""

""" Celery command line interface
 -> celery -A app.config.celery_app worker --loglevel=info # to start the Celery worker
 -> celery -A app.config.celery_app beat --loglevel=info # to start the Celery beat scheduler
 -> celery -A app.config.celery_app worker --beat --loglevel=info # to start both worker and beat
 -> celery -A app.config.celery_app flower # to start the Flower monitoring tool
 -> celery -A app.config.celery_app status # to check the status of Celery workers
"""