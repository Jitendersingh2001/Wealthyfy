import importlib
import pkgutil
from app.config.database import Base

# Dynamically import all modules in this package
package = __name__
for _, module_name, _ in pkgutil.iter_modules(__path__):
    importlib.import_module(f"{package}.{module_name}")