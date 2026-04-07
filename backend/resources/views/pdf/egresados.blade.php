<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Egresados {{ $añoEscolar }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #4a5568; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Lista de Egresados - Año Escolar {{ $añoEscolar }}</h1>
    <table>
        <thead>
            <tr>
                <th>Nombre del Estudiante</th>
                <th>Total de Asistencias</th>
                <th>Total de Inasistencias</th>
            </tr>
        </thead>
        <tbody>
            @foreach($egresados as $egresado)
            <tr>
                <td>{{ $egresado['nombre'] }}</td>
                <td>{{ $egresado['total_asistencias'] }}</td>
                <td>{{ $egresado['total_inasistencias'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
