<?php

/**
 * Default point presets shown in Quick Grading when a teacher has not
 * configured any of their own.
 *
 * These are code defaults, not user data, so they follow the active locale —
 * unlike stored `point_presets` rows, which are whatever an admin typed.
 */
return [
    'answer_question' => [
        'name' => '上课回答问题',
        'reason' => '上课积极回答问题',
    ],
    'good_homework' => [
        'name' => '作业优秀',
        'reason' => '作业完成质量优秀',
    ],
    'help_classmate' => [
        'name' => '帮助同学',
        'reason' => '主动帮助同学学习',
    ],
    'good_behaviour' => [
        'name' => '课堂表现好',
        'reason' => '课堂纪律表现好',
    ],
    'talking' => [
        'name' => '上课说话',
        'reason' => '上课随意说话',
    ],
    'sleeping' => [
        'name' => '上课睡觉',
        'reason' => '上课打瞌睡',
    ],
    'missing_homework' => [
        'name' => '未交作业',
        'reason' => '未按时提交作业',
    ],
    'late' => [
        'name' => '迟到',
        'reason' => '上课迟到',
    ],
];
