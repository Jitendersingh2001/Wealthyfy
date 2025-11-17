"""
Logger utility functions for convenient logging.

Usage examples:
    # Simple usage - automatically detects caller module
    from app.utils.logger_util import logger_info, logger_success
    logger_info("User logged in")
    logger_success("Payment processed", user_id=123)
    
    # Using with existing logger instance
    from app.config.logger import get_logger
    logger = get_logger(__name__)
    logger_info("Operation completed", logger_instance=logger)
"""
from typing import Optional
import logging
import inspect
from app.config.logger import get_logger


def logger_success(
    message: str,
    logger_name: Optional[str] = None,
    logger_instance: Optional[logging.Logger] = None,
    **kwargs
):
    """
    Log a success message at INFO level.
    
    Args:
        message: The message to log
        logger_name: Name of the logger (auto-detected if not provided)
        logger_instance: Optional logger instance to use directly
        **kwargs: Additional context to include in the message
    
    Example:
        logger_success("User created", user_id=123)
    """
    logger = _get_logger_instance(logger_name, logger_instance)
    context = _format_context(kwargs)
    full_message = f"✅ SUCCESS: {message}{context}"
    logger.info(full_message)


def logger_info(
    message: str,
    logger_name: Optional[str] = None,
    logger_instance: Optional[logging.Logger] = None,
    **kwargs
):
    """
    Log an informational message at INFO level.
    
    Args:
        message: The message to log
        logger_name: Name of the logger (auto-detected if not provided)
        logger_instance: Optional logger instance to use directly
        **kwargs: Additional context to include in the message
    
    Example:
        logger_info("Processing request", request_id="abc123")
    """
    logger = _get_logger_instance(logger_name, logger_instance)
    context = _format_context(kwargs)
    full_message = f"ℹ️  INFO: {message}{context}"
    logger.info(full_message)


def logger_debug(
    message: str,
    logger_name: Optional[str] = None,
    logger_instance: Optional[logging.Logger] = None,
    **kwargs
):
    """
    Log a debug message at DEBUG level.
    
    Args:
        message: The message to log
        logger_name: Name of the logger (auto-detected if not provided)
        logger_instance: Optional logger instance to use directly
        **kwargs: Additional context to include in the message
    
    Example:
        logger_debug("Variable value", value=42)
    """
    logger = _get_logger_instance(logger_name, logger_instance)
    context = _format_context(kwargs)
    full_message = f"🔍 DEBUG: {message}{context}"
    logger.debug(full_message)


def logger_warning(
    message: str,
    logger_name: Optional[str] = None,
    logger_instance: Optional[logging.Logger] = None,
    **kwargs
):
    """
    Log a warning message at WARNING level.
    
    Args:
        message: The message to log
        logger_name: Name of the logger (auto-detected if not provided)
        logger_instance: Optional logger instance to use directly
        **kwargs: Additional context to include in the message
    
    Example:
        logger_warning("Rate limit approaching", limit=100)
    """
    logger = _get_logger_instance(logger_name, logger_instance)
    context = _format_context(kwargs)
    full_message = f"⚠️  WARNING: {message}{context}"
    logger.warning(full_message)


def logger_error(
    message: str,
    logger_name: Optional[str] = None,
    logger_instance: Optional[logging.Logger] = None,
    **kwargs
):
    """
    Log an error message at ERROR level.
    
    Args:
        message: The message to log
        logger_name: Name of the logger (auto-detected if not provided)
        logger_instance: Optional logger instance to use directly
        **kwargs: Additional context to include in the message
    
    Example:
        logger_error("Failed to connect", host="example.com")
    """
    logger = _get_logger_instance(logger_name, logger_instance)
    context = _format_context(kwargs)
    full_message = f"❌ ERROR: {message}{context}"
    logger.error(full_message)


def logger_exception(
    message: str,
    logger_name: Optional[str] = None,
    logger_instance: Optional[logging.Logger] = None,
    exc_info: bool = True,
    **kwargs
):
    """
    Log an exception with traceback at ERROR level.
    
    Args:
        message: The message to log
        logger_name: Name of the logger (auto-detected if not provided)
        logger_instance: Optional logger instance to use directly
        exc_info: Whether to include exception traceback (default: True)
        **kwargs: Additional context to include in the message
    
    Example:
        try:
            risky_operation()
        except Exception:
            logger_exception("Operation failed")
    """
    logger = _get_logger_instance(logger_name, logger_instance)
    context = _format_context(kwargs)
    full_message = f"❌ EXCEPTION: {message}{context}"
    logger.exception(full_message, exc_info=exc_info)


def _get_logger_instance(
    logger_name: Optional[str],
    logger_instance: Optional[logging.Logger]
) -> logging.Logger:
    """
    Get the logger instance from either logger_name or logger_instance.
    Automatically detects caller module if logger_name is not provided.
    
    Args:
        logger_name: Name of the logger (optional, auto-detected if None)
        logger_instance: Logger instance object
        
    Returns:
        Logger instance
    """
    if logger_instance is not None:
        return logger_instance
    
    if logger_name is None:
        # Automatically detect the caller's module name
        frame = inspect.currentframe()
        try:
            # Go up 2 frames: current function -> logger function -> caller
            caller_frame = frame.f_back.f_back
            if caller_frame:
                module = inspect.getmodule(caller_frame)
                if module:
                    logger_name = module.__name__
                else:
                    # Fallback to frame's globals
                    logger_name = caller_frame.f_globals.get('__name__', __name__)
            else:
                logger_name = __name__
        except (AttributeError, TypeError):
            logger_name = __name__
        finally:
            del frame
    
    return get_logger(logger_name)


def _format_context(kwargs: dict) -> str:
    """
    Format additional context from kwargs into a readable string.
    
    Args:
        kwargs: Dictionary of additional context
        
    Returns:
        Formatted context string
    """
    if not kwargs:
        return ""
    
    context_parts = [f"{key}={value}" for key, value in kwargs.items()]
    return f" | Context: {', '.join(context_parts)}"

