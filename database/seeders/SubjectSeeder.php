<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            [
                'name' => '语文',
                'code' => 'CHN',
                'description' => '语文课程',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => '数学',
                'code' => 'MATH',
                'description' => '数学课程',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => '英语',
                'code' => 'ENG',
                'description' => '英语课程',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => '物理',
                'code' => 'PHY',
                'description' => '物理课程',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => '化学',
                'code' => 'CHEM',
                'description' => '化学课程',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => '生物',
                'code' => 'BIO',
                'description' => '生物课程',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => '历史',
                'code' => 'HIST',
                'description' => '历史课程',
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'name' => '地理',
                'code' => 'GEO',
                'description' => '地理课程',
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'name' => '政治',
                'code' => 'POL',
                'description' => '政治课程',
                'is_active' => true,
                'sort_order' => 9,
            ],
            [
                'name' => '体育',
                'code' => 'PE',
                'description' => '体育课程',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'name' => '音乐',
                'code' => 'MUSIC',
                'description' => '音乐课程',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'name' => '美术',
                'code' => 'ART',
                'description' => '美术课程',
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'name' => '信息技术',
                'code' => 'IT',
                'description' => '信息技术课程',
                'is_active' => true,
                'sort_order' => 13,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }
}
