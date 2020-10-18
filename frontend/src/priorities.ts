export const priorities: {
    name: string;
    style: string;
    hide?: boolean;
}[] = [
    {
        name: 'Meta',
        style: 'meta',
    },
    {
        name: 'Clarifying question',
        style: 'clarifying',
    },
    {
        name: 'Expand',
        style: 'expand',
    },
    {
        name: 'Follow-up question',
        style: 'probing',
        hide: true,
    },
    {
        name: 'Change topic',
        style: 'topic',
    },
]

export const getPriorityName = (priority: number) => (priorities[priority].name);
export const getPriorityStyle = (priority: number) => (priorities[priority].style);
