<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // GET /api/products
    public function index()
    {
        return response()->json(Product::all());
    }

    // GET /api/products/{id}
    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($product);
    }

    // POST /api/products  (admin)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'image_url' => 'nullable|url'
        ]);
        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'image_url' => $request->image_url
        ]);

        return response()->json($product, 201);
    }

    // PUT /api/products/{id}  (admin)
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $product->update($request->only([
            'name',
            'description',
            'price',
            'image_url'
        ]));

        return response()->json($product);
    }

    // DELETE /api/products/{id}  (admin)
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // borrar imagen local si existe
        if ($product->image_url && str_contains($product->image_url, '/storage/')) {
            $oldPath = str_replace(url('/storage') . '/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $product->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }

    // POST /api/products/{id}/image  (admin)
    /*
    public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048']
        ]);

        $product = Product::findOrFail($id);

        $file = $request->file('image');

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs("products/{$product->id}", $filename, 'public');

        $url = url("storage/" . $path);

        $product->image_url = $url;
        $product->save();

        return response()->json([
            'message' => 'Imagen subida correctamente',
            'image_url' => $url
        ]);
    }
    */
}