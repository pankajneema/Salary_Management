from pydantic import BaseModel

class DepartmentOut(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}
