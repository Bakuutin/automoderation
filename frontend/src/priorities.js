const priorityMap = {
    0: 'Meta',
    1: 'Clarifying question',
    2: 'Expand',
    3: 'Probing question',
    4: 'Change topic',
};

export const getPriorityName = (priority) => (priorityMap[priority]);
