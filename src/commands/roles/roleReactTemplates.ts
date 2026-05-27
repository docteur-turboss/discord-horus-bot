export type TemplateConfig = {
  name: string;
  roleKeywords: string[];
  defaultTitleKey: string;
  defaultDescKey: string;
  type: "button" | "menu";
};

export const roleReactTemplates: TemplateConfig[] = [
  {
    name: "age",
    roleKeywords: ["age", "ans"],
    defaultTitleKey: "role_react.template.age.title",
    defaultDescKey: "role_react.template.age.desc",
    type: "button",
  },
  {
    name: "sexe",
    roleKeywords: ["sexe", "genre", "homme", "femme", "gender"],
    defaultTitleKey: "role_react.template.sexe.title",
    defaultDescKey: "role_react.template.sexe.desc",
    type: "button",
  },
];

export function resolveTemplate(
  templateName: string,
  guild: { roles: { cache: Map<string, { name: string; managed: boolean; id: string }> } },
): { roleIds: string[]; config: TemplateConfig } | null {
  const config = roleReactTemplates.find((t) => t.name === templateName);
  if (!config) return null;

  const roleIds: string[] = [];
  for (const [, role] of guild.roles.cache) {
    if (role.managed) continue;
    const nameLower = role.name.toLowerCase();
    if (config.roleKeywords.some((kw) => nameLower.includes(kw))) {
      roleIds.push(role.id);
    }
  }

  return { roleIds, config };
}
