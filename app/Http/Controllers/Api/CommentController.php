<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // POST /api/comments (logueado)
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'content' => ['required', 'string', 'max:200'],
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'product_id' => $data['product_id'],
            'content' => $data['content'],
        ]);

        return response()->json($comment, 201);
    }

    // GET /api/comments/{product_id}
    public function byProduct($product_id)
    {
        $comments = Comment::where('product_id', $product_id)
            ->with('user:id,name,email')   // opcional, pero útil
            ->latest()
            ->get();

        return response()->json($comments);
    }
}
