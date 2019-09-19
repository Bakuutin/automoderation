const nameMap = {
    0: 'Meta',
    1: 'Clarifying question',
    2: 'Expand',
    3: 'Follow-up question',
    4: 'Change topic',
};

const styleMap = {
    0: 'meta',
    1: 'clarifying',
    2: 'expand',
    3: 'probing',
    4: 'topic',
};


export const getPriorityName = (priority) => (nameMap[priority]);
export const getPriorityStyle = (priority) => (styleMap[priority]);
