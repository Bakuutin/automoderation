const nameMap = [
    'Meta',
    'Clarifying question',
    'Expand',
    'Follow-up question',
    'Change topic',
];

const styleMap = [
    'meta',
    'clarifying',
    'expand',
    'probing',
    'topic',
];


export const getPriorityName = (priority: number) => (nameMap[priority]);
export const getPriorityStyle = (priority: number) => (styleMap[priority]);
