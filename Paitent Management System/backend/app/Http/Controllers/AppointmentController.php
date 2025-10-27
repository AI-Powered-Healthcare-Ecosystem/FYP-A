<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::query()->with(['patient', 'doctor']);

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', (int) $request->input('doctor_id'));
        }
        if ($request->filled('patient_id')) {
            $query->where('patient_id', (int) $request->input('patient_id'));
        }
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->input('to'));
        }
        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->whereHas('patient', function ($q) use ($s) {
                $q->where('name', 'like', "%$s%");
            });
        }

        // If perPage provided, paginate; else return all
        if ($request->filled('perPage')) {
            $perPage = max((int) $request->input('perPage', 10), 1);
            $items = $query->orderBy('date')->paginate($perPage);
            $collection = $items->getCollection()->map(function ($a) {
                return [
                    'id' => $a->id,
                    'patient_id' => $a->patient_id,
                    'doctor_id' => $a->doctor_id,
                    'patient_name' => $a->patient->name ?? null,
                    'date' => optional($a->date)->toDateString(),
                    'time' => $a->time,
                    'type' => $a->type,
                    'notes' => $a->notes,
                    'duration_minutes' => $a->duration_minutes,
                    'status' => $a->status,
                ];
            });
            $items->setCollection($collection);
            return response()->json($items);
        }

        $data = $query->orderBy('date')->get()->map(function ($a) {
            return [
                'id' => $a->id,
                'patient_id' => $a->patient_id,
                'doctor_id' => $a->doctor_id,
                'patient_name' => $a->patient->name ?? null,
                'date' => optional($a->date)->toDateString(),
                'time' => $a->time,
                'type' => $a->type,
                'notes' => $a->notes,
                'duration_minutes' => $a->duration_minutes,
                'status' => $a->status,
            ];
        });
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|integer|exists:patients,id',
            'doctor_id' => 'required|integer|exists:users,id',
            'date' => 'required|date',
            'time' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
            'type' => 'nullable|string|max:50',
            'duration_minutes' => 'nullable|integer|min:1',
            'status' => 'nullable|string|max:30',
        ]);
        $appt = Appointment::create(array_merge(['status' => 'Scheduled'], $data));
        return response()->json(['message' => 'Created', 'data' => $appt], 201);
    }

    public function update(Request $request, $id)
    {
        $appt = Appointment::findOrFail($id);
        $data = $request->validate([
            'patient_id' => 'sometimes|integer|exists:patients,id',
            'doctor_id' => 'sometimes|integer|exists:users,id',
            'date' => 'sometimes|date',
            'time' => 'sometimes|nullable|string|max:10',
            'notes' => 'sometimes|nullable|string',
            'type' => 'sometimes|nullable|string|max:50',
            'duration_minutes' => 'sometimes|nullable|integer|min:1',
            'status' => 'sometimes|nullable|string|max:30',
        ]);
        $appt->update($data);
        return response()->json(['message' => 'Updated', 'data' => $appt]);
    }

    public function destroy($id)
    {
        $appt = Appointment::findOrFail($id);
        $appt->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function show($id)
    {
        $a = Appointment::with(['patient','doctor'])->findOrFail($id);
        return response()->json([
            'id' => $a->id,
            'patient_id' => $a->patient_id,
            'doctor_id' => $a->doctor_id,
            'patient_name' => $a->patient->name ?? null,
            'date' => optional($a->date)->toDateString(),
            'time' => $a->time,
            'type' => $a->type,
            'notes' => $a->notes,
            'duration_minutes' => $a->duration_minutes,
            'status' => $a->status,
        ]);
    }
}
