<?php

namespace App\Http\Controllers\StudentCouncil;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StudentCouncilController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('student-council/dashboard');
    }

    public function activities()
    {
        return Inertia::render('student-council/activities');
    }
}
