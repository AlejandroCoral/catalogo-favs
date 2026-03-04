<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class ExternalController extends Controller
{
    public function quote()
    {
        $response = Http::get('https://api.chucknorris.io/jokes/random');

        if ($response->successful()) {

            $data = $response->json();

            return response()->json([
                'frase' => $data['value'],
                'fuente' => 'Chuck Norris API'
            ]);
        }

        return response()->json([
            'message' => 'No se pudo consumir la API externa'
        ], 500);
    }
}