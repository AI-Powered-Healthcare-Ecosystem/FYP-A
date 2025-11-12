<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add auth logic if needed
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'age' => 'nullable|integer',
            'gender' => 'required|string',
            'height_cm' => 'nullable|numeric|min:30|max:250',
            'weight_kg' => 'nullable|numeric|min:10|max:400',
            'physical_activity' => 'nullable|string',
            'medicalHistory' => 'nullable|string',
            'medications' => 'nullable|string',
            'remarks' => 'nullable|string',
            'insulinType' => 'nullable|string',
            'fvg' => 'nullable|numeric',
            'fvg_1' => 'nullable|numeric',
            'fvg_2' => 'nullable|numeric',
            'fvg_3' => 'nullable|numeric',
            'hba1c1' => 'nullable|numeric',
            'hba1c2' => 'nullable|numeric',
            'hba1c3' => 'nullable|numeric',
            'egfr' => 'nullable|numeric',
            'egfr1' => 'nullable|numeric',
            'egfr3' => 'nullable|numeric',
            'dds_1' => 'nullable|numeric',
            'dds_3' => 'nullable|numeric',
            'first_visit_date' => 'nullable|date',
            'second_visit_date' => 'nullable|date',
            'third_visit_date' => 'nullable|date',
            'user_id' => 'nullable|integer',
            // Therapy effectiveness fields
            'ethnicity' => 'nullable|string',
            'weight1' => 'nullable|numeric|min:10|max:400',
            'weight2' => 'nullable|numeric|min:10|max:400',
            'weight3' => 'nullable|numeric|min:10|max:400',
            'bmi1' => 'nullable|numeric|min:10|max:100',
            'bmi3' => 'nullable|numeric|min:10|max:100',
            'sbp' => 'nullable|numeric|min:50|max:300',
            'dbp' => 'nullable|numeric|min:30|max:200',
            'uacr1' => 'nullable|numeric|min:0',
            'uacr3' => 'nullable|numeric|min:0',
            'freq_smbg' => 'nullable|integer|min:0|max:1000',
        ];
    }
}
