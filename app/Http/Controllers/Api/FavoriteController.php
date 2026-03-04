<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    // GET /api/favorites
    public function index(Request $request)
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with('product') // opcional: si tienes relación en el modelo
            ->get();

        return response()->json($favorites);
    }

    // POST /api/favorites
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $data['product_id'],
        ]);

        return response()->json($favorite, 201);
    }

    // DELETE /api/favorites/{product_id}
    public function destroy(Request $request, $product_id)
    {
        $deleted = Favorite::where('user_id', $request->user()->id)
            ->where('product_id', $product_id)
            ->delete();

        if ($deleted === 0) {
            throw ValidationException::withMessages([
                'favorite' => ['Este producto no está en tus favoritos.'],
            ]);
        }

        return response()->json([
            'message' => 'Eliminado de favoritos',
        ]);
    }
}