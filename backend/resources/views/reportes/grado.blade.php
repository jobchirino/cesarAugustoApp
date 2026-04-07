<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte {{ $grado->grado }} - Sección {{ $grado->seccion }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
        .info { margin-bottom: 20px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #4a5568; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <h1>Reporte de Grado</h1>
    <p class="subtitle">{{ $grado->grado }} - Sección {{ $grado->seccion }}</p>
    
    <div class="info">
        <p><strong>Docente:</strong> {{ $grado->docente }}</p>
        <p><strong>Total Estudiantes:</strong> {{ $estudiantes->count() }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nombre del Estudiante</th>
                <th class="text-center">Asistencias</th>
                <th class="text-center">Inasistencias</th>
                <th class="text-center">Lapsos Evaluados</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estudiantes as $estudiante)
            <tr>
                <td>{{ $estudiante['nombre'] }}</td>
                <td class="text-center">{{ $estudiante['total_asistencias'] }}</td>
                <td class="text-center">{{ $estudiante['total_inasistencias'] }}</td>
                <td class="text-center">{{ $estudiante['lapsos_evaluados'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
