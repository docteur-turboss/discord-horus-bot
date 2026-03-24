import { PERMISSION_MAP } from "utils/consts/permissionMap";
import { t } from "utils/locales/i18n";

export const formatPerm = (perm: string, lang: string) =>
  t(lang, PERMISSION_MAP[perm].permissionName ?? perm);