<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        // Public signup always creates a citizen — elevated roles are created by admins only
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'citizen',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function clerkSync(Request $request)
    {
        // Get the token and decode it manually without the middleware enforcing user existence
        // Alternatively, since clerk-sync is NOT in the middleware group, we do it directly here:
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'No token'], 401);
        }

        try {
            $jwks = \Illuminate\Support\Facades\Cache::remember('clerk_jwks', 3600, function () {
                $response = \Illuminate\Support\Facades\Http::withToken(env('CLERK_SECRET_KEY'))->get('https://api.clerk.com/v1/jwks');
                return $response->json();
            });

            $keys = \Firebase\JWT\JWK::parseKeySet($jwks);
            $decoded = \Firebase\JWT\JWT::decode($token, $keys);

            $clerkId = $decoded->sub;

            // Upsert the user in the database
            $user = User::updateOrCreate(
                ['clerk_id' => $clerkId],
                [
                    'name' => $request->name,
                    'email' => $request->email,
                    'role' => $request->role ?? 'citizen',
                    'password' => null // No local password needed
                ]
            );

            return response()->json(['message' => 'Sync successful', 'user' => $user]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Sync failed: ' . $e->getMessage()], 400);
        }
    }
}

