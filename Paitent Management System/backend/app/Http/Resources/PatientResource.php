<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'age' => $this->age,
            'gender' => $this->gender,
            'ethnicity' => $this->ethnicity,
            'height_cm' => $this->height_cm,
            'weight_kg' => $this->weight_kg,
            'weight1' => $this->weight1,
            'weight2' => $this->weight2,
            'weight3' => $this->weight3,
            'bmi1' => $this->bmi1,
            'bmi3' => $this->bmi3,
            'physical_activity' => $this->physical_activity,
            'medicalHistory' => $this->medical_history,
            'medications' => $this->medications,
            'remarks' => $this->remarks,
            'insulin_regimen_type' => $this->insulin_regimen_type,
            'fvg' => $this->fvg,
            'fvg_1' => $this->fvg_1,
            'fvg_2' => $this->fvg_2,
            'fvg_3' => $this->fvg_3,
            'hba1c_1st_visit' => $this->hba1c_1st_visit,
            'hba1c_2nd_visit' => $this->hba1c_2nd_visit,
            'hba1c_3rd_visit' => $this->hba1c_3rd_visit,
            'sbp' => $this->sbp,
            'dbp' => $this->dbp,
            'egfr' => $this->egfr,
            'egfr1' => $this->egfr1,
            'egfr3' => $this->egfr3,
            'uacr1' => $this->uacr1,
            'uacr3' => $this->uacr3,
            'dds_1' => $this->dds_1,
            'dds_3' => $this->dds_3,
            'first_visit_date' => $this->first_visit_date,
            'second_visit_date' => $this->second_visit_date,
            'third_visit_date' => $this->third_visit_date,
            'avg_fvg_1_2' => $this->avg_fvg_1_2,
            'fvg_delta_1_2' => $this->fvg_delta_1_2,
            'reduction_a' => $this->reduction_a,
            'reduction_a_2_3' => $this->reduction_a_2_3,
            'reduction_a_per_day' => $this->reduction_a_per_day,
            'gap_from_initial_visit' => $this->gap_from_initial_visit,
            'gap_from_first_clinical_visit' => $this->gap_from_first_clinical_visit,
            'gap_1_2_days' => $this->gap_1_2_days,
            'gap_2_3_days' => $this->gap_2_3_days,
            'dds_trend_1_3' => $this->dds_trend_1_3,
            'last_risk_score' => $this->last_risk_score,
            'last_risk_label' => $this->last_risk_label,
            'risk_model_version' => $this->risk_model_version,
            'last_predicted_at' => $this->last_predicted_at,
            'user_id' => $this->user_id,
            'assigned_doctor_id' => $this->assigned_doctor_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
