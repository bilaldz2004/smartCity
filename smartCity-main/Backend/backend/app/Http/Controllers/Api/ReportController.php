<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Report::with('user:id,name,role')->latest();
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        $reports = $query->get();
        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'severity' => 'nullable|string',
            'location_text' => 'required|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'image' => 'nullable|image|max:10240',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('reports', 'public');
        }

        $report = \App\Models\Report::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'title' => $request->title ?? 'Report from ' . now()->format('Y-m-d'),
            'description' => $request->description,
            'category' => $request->category,
            'severity' => $request->severity ?? 'low',
            'status' => 'submitted',
            'location_text' => $request->location_text,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'image_path' => $imagePath,
        ]);

        return response()->json($report, 201);
    }

    public function show(string $id)
    {
        $report = \App\Models\Report::with('user:id,name,role')->findOrFail($id);
        return response()->json($report);
    }

    public function update(Request $request, string $id)
    {
        $report = \App\Models\Report::findOrFail($id);
        $report->update($request->only(['status', 'severity', 'category']));
        return response()->json($report);
    }

    public function destroy(string $id)
    {
        $report = \App\Models\Report::findOrFail($id);
        $report->delete();
        return response()->noContent();
    }
}
