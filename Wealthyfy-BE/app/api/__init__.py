import pkgutil
import importlib
from fastapi import APIRouter

# Create a router to include all sub-routers
router = APIRouter()

package = __name__  # this points to app.api
for _, module_name, _ in pkgutil.iter_modules(__path__):
    module = importlib.import_module(f"{package}.{module_name}")
    # If module has a router, include it
    if hasattr(module, "router"):
        router.include_router(module.router)