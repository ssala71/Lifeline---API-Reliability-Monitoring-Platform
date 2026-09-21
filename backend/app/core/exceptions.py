class ServiceNotFoundError(Exception):
    def __init__(self, service_id: int):
        self.service_id = service_id