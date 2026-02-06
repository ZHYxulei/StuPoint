<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\ClassStudent;
use App\Models\ClassTeacher;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // Get role-specific validation rules
        $rules = $this->getRulesForRole($input['role'] ?? 'student');

        Validator::make($input, $rules)->validate();

        return DB::transaction(function () use ($input) {
            $role = $input['role'] ?? 'student';

            // Prepare user data based on role
            $userData = $this->prepareUserData($input, $role);

            // Create user
            $user = User::create([
                ...$userData,
                'password' => Hash::make($input['password']),
            ]);

            // Set default nickname if not provided
            if (empty($userData['nickname'])) {
                $user->update([
                    'nickname' => $user->name,
                ]);
            }

            // Attach role
            $roleModel = Role::where('slug', $role)->firstOrFail();
            $user->roles()->attach($roleModel->id);

            // Handle role-specific additional data
            $this->handleRoleSpecificData($user, $input, $role);

            return $user;
        });
    }

    /**
     * Get validation rules for specific role.
     */
    protected function getRulesForRole(string $role): array
    {
        $baseRules = [
            'role' => ['required', 'in:student,teacher,parent'],
            'password' => $this->passwordRules(),
        ];

        return match ($role) {
            'student' => [
                ...$baseRules,
                'id_number' => ['required', 'string', 'max:50', 'unique:users,id_number'],
                'name' => ['required', 'string', 'max:255'],
                'nickname' => ['nullable', 'string', 'max:255'],
                'class_id' => ['nullable', 'exists:classes,id'],
                'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
                'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
                'email_or_phone' => ['required_without:email,phone', function ($attribute, $value, $fail) {
                    // Custom validation for email_or_phone field
                    if (! $value) {
                        return;
                    }
                    $isEmail = filter_var($value, FILTER_VALIDATE_EMAIL);
                    $isPhone = preg_match('/^[0-9+\s\-]+$/', $value);

                    if (! $isEmail && ! $isPhone) {
                        $fail('请输入有效的手机号或电子邮箱');
                    }
                }],
            ],
            'teacher' => [
                ...$baseRules,
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'teaching_classes' => ['nullable', 'array'],
                'teaching_classes.*' => ['exists:classes,id'],
                'subjects' => ['nullable', 'array'],
                'subjects.*' => ['exists:subjects,id'],
                'is_head_teacher' => ['boolean'],
            ],
            'parent' => [
                ...$baseRules,
                'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
                'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
                'email_or_phone' => ['required_without:email,phone', function ($attribute, $value, $fail) {
                    if (! $value) {
                        return;
                    }
                    $isEmail = filter_var($value, FILTER_VALIDATE_EMAIL);
                    $isPhone = preg_match('/^[0-9+\s\-]+$/', $value);

                    if (! $isEmail && ! $isPhone) {
                        $fail('请输入有效的手机号或电子邮箱');
                    }
                }],
            ],
            default => $baseRules,
        };
    }

    /**
     * Prepare user data based on role.
     */
    protected function prepareUserData(array $input, string $role): array
    {
        return match ($role) {
            'student' => [
                'name' => $input['name'] ?? null,
                'email' => $input['email'] ?: null,
                'phone' => $input['phone'] ?: null,
                'id_number' => $input['id_number'],
                'nickname' => $input['nickname'] ?? null,
                'grade' => null, // Will be set from class if provided
                'class' => null, // Will be set from class if provided
            ],
            'teacher' => [
                'name' => null, // Will be set later
                'email' => $input['email'],
                'phone' => null,
                'is_head_teacher' => $input['is_head_teacher'] ?? false,
            ],
            'parent' => [
                'name' => null,
                'email' => $input['email'] ?: null,
                'phone' => $input['phone'] ?: null,
            ],
            default => [],
        };
    }

    /**
     * Handle role-specific additional data.
     */
    protected function handleRoleSpecificData(User $user, array $input, string $role): void
    {
        match ($role) {
            'student' => $this->handleStudentData($user, $input),
            'teacher' => $this->handleTeacherData($user, $input),
            'parent' => null,
            default => null,
        };
    }

    /**
     * Handle student-specific data.
     */
    protected function handleStudentData(User $user, array $input): void
    {
        // Assign student to class if provided
        if (! empty($input['class_id'])) {
            $class = SchoolClass::find($input['class_id']);
            if ($class) {
                ClassStudent::create([
                    'class_id' => $class->id,
                    'student_id' => $user->id,
                ]);

                // Update user's grade and class from the school class
                $user->update([
                    'grade' => $class->grade,
                    'class' => $class->name,
                ]);
            }
        }
    }

    /**
     * Handle teacher-specific data.
     */
    protected function handleTeacherData(User $user, array $input): void
    {
        // Attach teaching classes
        if (! empty($input['teaching_classes']) && is_array($input['teaching_classes'])) {
            foreach ($input['teaching_classes'] as $classId) {
                $class = SchoolClass::find($classId);
                if ($class) {
                    // Create or update class teacher relationship
                    ClassTeacher::updateOrCreate(
                        [
                            'class_id' => $class->id,
                            'teacher_id' => $user->id,
                        ],
                        ['subject' => null] // Subject will be managed separately
                    );
                }
            }
        }

        // Attach subjects
        if (! empty($input['subjects']) && is_array($input['subjects'])) {
            $user->subjects()->sync($input['subjects']);
        }

        // Set default name for teacher (email username)
        if (empty($user->name)) {
            $user->update([
                'name' => explode('@', $user->email)[0],
            ]);
        }
    }
}
