<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jurnal;
use Exception;
use Illuminate\Validation\ValidationException;

class JurnalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $nisn = $request->query('nisn');
            
            $query = Jurnal::query();
            if ($nisn) {
                $query->where('nisn', $nisn);
            }

            $data = $query->get();
            return response()->json(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Validasi: Pastikan nisn, kegiatan, dan foto terisi (mendukung string Base64 dari frontend)
            $request->validate([
                'nisn' => 'required',
                'kegiatan' => 'required',
                'foto' => 'required',
            ], [
                'nisn.required' => 'NISN siswa tidak ditemukan.',
                'kegiatan.required' => 'Uraian kegiatan wajib diisi.',
                'foto.required' => 'Wajib isi bukti pengerjaan',
            ]);

            $nisn = $request->nisn;
            $tanggal = $request->tanggal ?? date('Y-m-d');

            $existingJurnal = Jurnal::where('nisn', $nisn)
                                     ->where('tanggal', $tanggal)
                                     ->first();

            if ($existingJurnal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jurnal untuk tanggal ini sudah diisi! (Maksimal 1 kali sehari)'
                ], 422);
            }

            // Proses penyimpanan foto dari format Base64 (yang dikirim StudentDashboard.jsx)
            $path = null;
            if ($request->filled('foto')) {
                $fotoData = $request->foto;
                
                if (preg_match('/^data:image\/(\w+);base64,/', $fotoData, $type)) {
                    $image_base64 = substr($fotoData, strpos($fotoData, ',') + 1);
                    $image_base64 = base64_decode($image_base64);
                    
                    $extension = strtolower($type[1]);
                    $filename = time() . '_' . uniqid() . '.' . $extension;
                    
                    $destinationPath = public_path('uploads/jurnal');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    
                    file_put_contents($destinationPath . '/' . $filename, $image_base64);
                    $path = 'uploads/jurnal/' . $filename;
                } else {
                    $path = $fotoData;
                }
            }

            $jurnal = Jurnal::create([
                'nisn' => $nisn,
                'tanggal' => $tanggal,
                'kegiatan' => $request->kegiatan,
                'status' => 'Pending',
                'foto' => $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jurnal harian berhasil dikirim!',
                'data' => $jurnal
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $jurnal = Jurnal::findOrFail($id);

            $request->validate([
                'kegiatan' => 'required',
                'foto' => 'sometimes|nullable',
            ]);

            $tanggal = $request->tanggal;
            if ($tanggal && str_contains($tanggal, '/')) {
                $parts = explode('/', $tanggal);
                if (count($parts) === 3 && strlen($parts[2]) === 4) {
                    $tanggal = "{$parts[2]}-{$parts[1]}-{$parts[0]}";
                }
            }

            $path = $jurnal->foto;
            if ($request->filled('foto')) {
                if ($path && file_exists(public_path($path))) {
                    @unlink(public_path($path));
                }
                
                $fotoData = $request->foto;
                if (preg_match('/^data:image\/(\w+);base64,/', $fotoData, $type)) {
                    $image_base64 = substr($fotoData, strpos($fotoData, ',') + 1);
                    $image_base64 = base64_decode($image_base64);
                    $extension = strtolower($type[1]);
                    $filename = time() . '_' . uniqid() . '.' . $extension;
                    
                    $destinationPath = public_path('uploads/jurnal');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    
                    file_put_contents($destinationPath . '/' . $filename, $image_base64);
                    $path = 'uploads/jurnal/' . $filename;
                } else {
                    $path = $fotoData;
                }
            }

            $jurnal->update([
                'tanggal' => $tanggal ?? $jurnal->tanggal,
                'kegiatan' => $request->kegiatan ?? $jurnal->kegiatan,
                'status' => 'Pending',
                'foto' => $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil diperbarui dan dikirim ulang!',
                'data' => $jurnal
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first()
            ], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function approve(int $id)
    {
        try {
            $jurnal = Jurnal::findOrFail($id);
            $jurnal->status = 'Approved';
            $jurnal->save();

            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil disetujui!',
                'data' => $jurnal
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function revise(Request $request, int $id)
    {
        try {
            $jurnal = Jurnal::findOrFail($id);
            $jurnal->status = 'Revisi';
            if ($request->has('catatan')) {
                $jurnal->catatan_dudi = $request->catatan;
            }
            $jurnal->save();

            return response()->json([
                'success' => true,
                'message' => 'Jurnal dikembalikan untuk direvisi!',
                'data' => $jurnal
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, int $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:Approved,Revisi,Pending,Disetujui,Direvisi'
            ]);

            $jurnal = Jurnal::findOrFail($id);
            $jurnal->status = $request->status;
            
            if ($request->has('catatan')) {
                $jurnal->catatan_dudi = $request->catatan;
            }

            $jurnal->save();

            return response()->json([
                'success' => true,
                'message' => 'Status jurnal berhasil diperbarui!',
                'data' => $jurnal
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first()
            ], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $jurnal = Jurnal::findOrFail($id);
            if ($jurnal->foto && file_exists(public_path($jurnal->foto))) {
                @unlink(public_path($jurnal->foto));
            }
            $jurnal->delete();
            return response()->json(['success' => true, 'message' => 'Jurnal berhasil dihapus']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}