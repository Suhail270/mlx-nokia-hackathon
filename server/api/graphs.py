import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

def generate_insights_and_charts(excel_file_path: str, temp_dir: str = "temp"):

    os.makedirs(temp_dir, exist_ok=True)
    alerts_df = pd.read_excel(excel_file_path, sheet_name="alerts")
    ambulance_df = pd.read_excel(excel_file_path, sheet_name="ambulance")
    firefighter_df = pd.read_excel(excel_file_path, sheet_name="firefighter")
    police_df = pd.read_excel(excel_file_path, sheet_name="police")
    drone_df = pd.read_excel(excel_file_path, sheet_name="drone")
    dispatch_df = pd.read_excel(excel_file_path, sheet_name="dispatch")

    alerts_df["Timestamp"] = pd.to_datetime(alerts_df["Timestamp"], errors="coerce")
    dispatch_df["Dispatch time"] = pd.to_datetime(dispatch_df["Dispatch time"], errors="coerce")

    alerts_df["Response Time"] = pd.to_numeric(alerts_df["Response Time"], errors="coerce")
    alerts_df["Resolution Time"] = pd.to_numeric(alerts_df["Resolution Time"], errors="coerce")

    dispatch_df.replace("NULL", pd.NA, inplace=True)

    alerts_df["TimeRatio"] = alerts_df.apply(
        lambda row: (row["Resolution Time"] / row["Response Time"])
        if (row["Response Time"] and row["Response Time"] > 0) else pd.NA,
        axis=1
    )

    alerts_df["IsResolved"] = alerts_df["Status"].apply(lambda x: x == "resolved")

    severity_map = {"critical": 3, "high": 2, "warning": 1}
    alerts_df["SeverityCode"] = alerts_df["Severity"].map(severity_map)

    count_by_type = alerts_df["Type"].value_counts().to_dict()
    count_by_severity = alerts_df["Severity"].value_counts().to_dict()
    count_by_status = alerts_df["Status"].value_counts().to_dict()
    avg_response_by_type = alerts_df.groupby("Type")["Response Time"].mean().to_dict()
    avg_response_by_severity = alerts_df.groupby("Severity")["Response Time"].mean().to_dict()
    avg_resolution_time_by_type = alerts_df.groupby("Type")["Resolution Time"].mean().to_dict()
    resolution_rate_by_type = alerts_df.groupby("Type")["IsResolved"].mean().to_dict()

    dispatch_stats = {}
    dispatch_stats["police_dispatch_count"] = dispatch_df["Police ID"].notna().sum()
    dispatch_stats["ambulance_dispatch_count"] = dispatch_df["Ambulance ID"].notna().sum()
    dispatch_stats["firefighter_dispatch_count"] = dispatch_df["Firefighter ID"].notna().sum()
    dispatch_stats["drone_dispatch_count"] = dispatch_df["Drone ID"].notna().sum()

    key_metrics = {
        "count_by_type": count_by_type,
        "count_by_severity": count_by_severity,
        "count_by_status": count_by_status,
        "avg_response_by_type": avg_response_by_type,
        "avg_response_by_severity": avg_response_by_severity,
        "avg_resolution_time_by_type": avg_resolution_time_by_type,
        "resolution_rate_by_type": resolution_rate_by_type,
        "dispatch_stats": dispatch_stats,
    }

    sns.set_style("whitegrid")

    plt.figure(figsize=(6,4))
    sns.countplot(data=alerts_df, x="Type", palette="Set2")
    plt.title("Count of Alerts by Type")
    plt.xlabel("Alert Type")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "alerts_by_type.png"))
    plt.close()

    plt.figure(figsize=(6,4))
    sns.countplot(data=alerts_df, x="Severity", palette="Set3")
    plt.title("Count of Alerts by Severity")
    plt.xlabel("Severity")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "alerts_by_severity.png"))
    plt.close()

    plt.figure(figsize=(6,4))
    sns.countplot(data=alerts_df, x="Status", palette="Set1")
    plt.title("Count of Alerts by Status")
    plt.xlabel("Status")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "alerts_by_status.png"))
    plt.close()

    avg_response = alerts_df.groupby("Type")["Response Time"].mean().reset_index()
    plt.figure(figsize=(6,4))
    sns.barplot(data=avg_response, x="Type", y="Response Time", palette="coolwarm")
    plt.title("Average Response Time by Alert Type")
    plt.xlabel("Alert Type")
    plt.ylabel("Avg. Response Time (min)")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "avg_response_by_type.png"))
    plt.close()

    avg_resolution = alerts_df.groupby("Type")["Resolution Time"].mean().reset_index()
    plt.figure(figsize=(6,4))
    sns.barplot(data=avg_resolution, x="Type", y="Resolution Time", palette="flare")
    plt.title("Average Resolution Time by Alert Type")
    plt.xlabel("Alert Type")
    plt.ylabel("Avg. Resolution Time (min)")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "avg_resolution_by_type.png"))
    plt.close()

    plt.figure(figsize=(6,4))
    sns.histplot(data=alerts_df, x="Response Time", kde=True)
    plt.title("Distribution of Response Times")
    plt.xlabel("Response Time (min)")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "dist_response_time.png"))
    plt.close()

    plt.figure(figsize=(6,4))
    sns.histplot(data=alerts_df, x="Resolution Time", kde=True)
    plt.title("Distribution of Resolution Times")
    plt.xlabel("Resolution Time (min)")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "dist_resolution_time.png"))
    plt.close()

    dispatch_summary_df = pd.DataFrame.from_dict(dispatch_stats, orient="index", columns=["Count"]).reset_index()
    dispatch_summary_df.rename(columns={"index": "Service"}, inplace=True)
    plt.figure(figsize=(6,4))
    sns.barplot(data=dispatch_summary_df, x="Service", y="Count", palette="viridis")
    plt.title("Dispatch Counts by Service")
    plt.xlabel("Service")
    plt.ylabel("Dispatch Count")
    plt.tight_layout()
    plt.savefig(os.path.join(temp_dir, "dispatch_counts.png"))
    plt.close()

    return key_metrics
