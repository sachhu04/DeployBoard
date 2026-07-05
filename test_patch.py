from kubernetes import client, config
from datetime import datetime, timezone
import json

config.load_kube_config()
api = client.AppsV1Api()
now = datetime.now(timezone.utc).isoformat()

body = {
    "spec": {
        "template": {
            "metadata": {
                "annotations": {
                    "kubectl.kubernetes.io/restartedAt": str(now)
                }
            }
        }
    }
}

print("Patching...")
try:
    res = api.patch_namespaced_deployment(name="frontend", namespace="demo-app", body=body)
    print("Success:", res.status)
except Exception as e:
    print("Error:", e)
