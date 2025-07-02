import time

import psutil
from flask_login import current_user


def generate_before_request_log(request) -> str:
    """Log the details of the request before it is processed.

    Parameters:
      request (flask.Request): the request object

    Returns:
      str: the log message
    """

    user = current_user.email if current_user.is_authenticated else "Anonymous"
    request_method = request.method
    request_url = request.url
    user_agent = request.user_agent.string

    message = f"REQUEST - User: {user} | Method: {request_method} | URL: {request_url} | System Resource: {generate_system_resource_log()} | User Agent: {user_agent}"

    return message


def generate_after_request_log(request, response) -> str:
    """Log the details of the request after it is processed.

    Parameters:
      request (flask.Request): the request object
      response (flask.Response): the response object

    Returns:
      str: the log message
    """
    response_status = response.status
    elapsed_time = time.time() - request.start_time

    message = f"RESPONSE - Status: {response_status} | System Resource: {generate_system_resource_log()} | Response Time: {elapsed_time}"

    return message


def generate_system_resource_log() -> str:
    """Log the system resources.

    Returns:
      str: the log message
    """

    cpu_percent = psutil.cpu_percent()
    ram_percent = psutil.virtual_memory().percent
    disk_percent = psutil.disk_usage("/").percent

    message = f"CPU: {cpu_percent}% | RAM: {ram_percent}% | Disk: {disk_percent}%"

    return message


def system_resource_usages_on_tool_execution(process) -> str:
    """Log the system resources.

    Returns:
      str: the log message
    """

    cpu_usage = process.cpu_percent()
    mem_usage = process.memory_info().rss / 1024 / 1024
    process = process.name()

    message = f"Process: {process} | CPU: {cpu_usage}% | RAM: {mem_usage} MB"

    return message
