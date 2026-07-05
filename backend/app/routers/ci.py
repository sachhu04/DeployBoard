from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ci.builder import start_pipeline, get_status

router = APIRouter(prefix="/api/ci", tags=["CI/CD"])

class DeployRequest(BaseModel):
    app_name: str
    repo_url: str

@router.post("/deploy")
def trigger_deployment(req: DeployRequest):
    if not req.app_name or not req.repo_url:
        raise HTTPException(status_code=400, detail="app_name and repo_url are required")
        
    try:
        start_pipeline(req.app_name, req.repo_url)
        return {"message": f"Deployment started for {req.app_name}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{app_name}")
def deployment_status(app_name: str):
    status = get_status(app_name)
    if status["status"] == "not_found":
        raise HTTPException(status_code=404, detail="No deployment found for this app")
    return status
