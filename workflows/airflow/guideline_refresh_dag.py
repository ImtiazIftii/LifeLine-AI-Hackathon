"""Example Airflow DAG for validated maternal guideline refreshes."""
from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator


def stage_guidelines():
    print("Stage source documents with publisher, URL, version, and review status.")


def require_clinical_approval():
    print("Block publication until a clinical reviewer approves transformed chunks.")


with DAG(
    "lifeline_guideline_refresh",
    start_date=datetime(2026, 1, 1),
    schedule="@weekly",
    catchup=False,
    tags=["lifeline", "responsible-ai"],
) as dag:
    stage = PythonOperator(task_id="stage_guidelines", python_callable=stage_guidelines)
    approval = PythonOperator(task_id="require_clinical_approval", python_callable=require_clinical_approval)
    stage >> approval
