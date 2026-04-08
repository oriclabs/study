export interface TopicNode {
  id: string;
  title: string;
  prereqs: string[];
  children?: string[];
}

export interface TopicGraph {
  subject: string;
  nodes: Record<string, TopicNode>;
  roots: string[];
}
