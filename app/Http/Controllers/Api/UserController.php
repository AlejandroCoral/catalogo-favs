<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{

    public function index()
    {
        return User::select('id','name','email','is_admin')->get();
    }

    public function makeAdmin($id)
    {
        $user = User::findOrFail($id);

        $user->is_admin = 1;

        $user->save();

        return response()->json([
            'message' => 'Usuario ahora es admin'
        ]);
    }

    public function removeAdmin($id)
    {
        $user = User::findOrFail($id);
        $user->is_admin = 0;
        $user->save();

        return response()->json([
            'message' => 'Admin removido',
            'user' => $user
        ]);
    }

}