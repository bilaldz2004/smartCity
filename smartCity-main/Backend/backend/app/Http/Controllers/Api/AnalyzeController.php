<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnalyzeController extends Controller
{
    /**
     * Proxy an image to the Python FastAPI AI service for analysis.
     * Returns the detected category, severity, and confidence.
     */
    public function analyze(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
        ]);

        $aiServiceUrl = env('AI_SERVICE_URL', 'http://localhost:8001');

        try {
            $file = $request->file('image');

            $response = Http::timeout(30)
                ->attach(
                    'image',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )
                ->post("{$aiServiceUrl}/analyze");

            if ($response->failed()) {
                return response()->json([
                    'detected'    => false,
                    'category'    => null,
                    'severity'    => null,
                    'confidence'  => null,
                    'model_used'  => null,
                    'error'       => 'AI service returned an error: ' . $response->status(),
                ], 502);
            }

            return response()->json($response->json());

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // FastAPI service is not running
            return response()->json([
                'detected'   => false,
                'category'   => null,
                'severity'   => null,
                'confidence' => null,
                'model_used' => null,
                'error'      => 'AI service is offline. Please fill the fields manually.',
            ], 503);

        } catch (\Exception $e) {
            return response()->json([
                'detected'   => false,
                'category'   => null,
                'severity'   => null,
                'confidence' => null,
                'model_used' => null,
                'error'      => 'Unexpected error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
