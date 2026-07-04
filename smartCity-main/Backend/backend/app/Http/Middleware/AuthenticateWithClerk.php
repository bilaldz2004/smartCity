<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use Firebase\JWT\Key;
use App\Models\User;

class AuthenticateWithClerk
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            // Fetch Clerk JWKS and cache it for an hour
            $jwks = Cache::remember('clerk_jwks', 3600, function () {
                $response = Http::withToken(env('CLERK_SECRET_KEY'))->get('https://api.clerk.com/v1/jwks');
                if (!$response->successful()) {
                    throw new \Exception('Failed to fetch JWKS from Clerk API');
                }
                return $response->json();
            });

            // Parse the keys and decode the token
            $keys = JWK::parseKeySet($jwks);
            $decoded = JWT::decode($token, $keys);

            // $decoded->sub contains the Clerk user ID
            $clerkId = $decoded->sub;

            // Find the user in the database
            $user = User::where('clerk_id', $clerkId)->first();

            // If user doesn't exist, we might have received a request before /clerk-sync finished,
            // or we might need to fallback to email matching (if they signed up before Clerk).
            // But we will let /clerk-sync handle the creation. If not found, return 401.
            if (!$user) {
                // Try to fallback to email if available in the token claims (sometimes Clerk includes it if configured)
                // For simplicity, we just reject if not synced.
                return response()->json(['message' => 'User not synced with backend.'], 401);
            }

            // Authenticate the user for this request lifecycle
            auth()->setUser($user);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Unauthenticated. ' . $e->getMessage()], 401);
        }
    }
}
