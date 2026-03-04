<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // ✅ Esto evita el error "Add [name] to fillable property..."
    protected $fillable = [
        'name',
        'description',
        'price',
        'image_url',
    ];

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
