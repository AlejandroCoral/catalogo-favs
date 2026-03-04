<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $product = Product::create($request->all());

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $product->update($request->all());

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }

    public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048']
        ]);

        $product = \App\Models\Product::findOrFail($id);

        $file = $request->file('image');

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs("products/{$product->id}", $filename, 'public');

        $url = asset('storage/' . $path);

        $product->image_url = $url;
        $product->save();

        return response()->json([
            'message' => 'Imagen subida correctamente',
            'image_url' => $url
        ]);
    }


    /*
    public function uploadImage(Request $request, $id)
    {
        return response()->json([
            'hasFile_image' => $request->hasFile('image'),
            'all_files_keys' => array_keys($request->allFiles()),
            'content_type' => $request->header('Content-Type'),
        ]);
    }
        */

/*
   public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $product = Product::findOrFail($id);

        // (opcional) borrar imagen anterior si existe y es local
        if ($product->image_url && str_contains($product->image_url, '/storage/')) {
            $oldPath = str_replace(url('/storage') . '/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $file = $request->file('image');

        // nombre único
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();

        // guarda en: storage/app/public/products/{id}/...
        $path = $file->storeAs("products/{$product->id}", $filename, 'public');

        // url pública: http://127.0.0.1:8000/storage/...
        $publicUrl = url("storage/" . $path);

        $product->image_url = $publicUrl;
        $product->save();

        return response()->json([
            'message' => 'Imagen subida (local)',
            'image_url' => $publicUrl,
            'product' => $product,
        ], 200);
    }
*/
}