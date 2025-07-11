<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /** Nombre de la tabla asociada al modelo
     * @var string */
    protected $table = "usuarios";

    /** Clave primaria de la tabla
     * @var string */
    protected $primaryKey = "ID_User";

    /** Determinar si la tabla tendra timestamps en sus registros
     * @var bool */
    public $timestamps = false;

    /** Los atributos que pueden ser asignados en consultas de datos masivas. (Y obtenidos si se hace un get)
     * @var list<string> */
    protected $fillable = [
        'Cod_User',
        'Ape_Pat',
        'Ape_Mat',
        'Nombre',
        'Correo',
        'UltimoAcceso',
        'Contra'
    ];

    /** Los atributos que deben ser ocultados para la serialización. (Ocultos en consultas get)
     * @var list<string> */
    protected $hidden = [
        'Contra'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the personalized password field for the user
     * 
     * @return string
     */
    public function getAuthPassword(){
        return $this->Contra;
    }
}
