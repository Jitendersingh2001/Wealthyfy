<#-- macros/user-utils.ftl -->
<#macro getFullName user>
  <#if user.firstName?? || user.lastName??>
      <#assign fullName = "${(user.firstName!)} ${(user.lastName!)}"?trim>
  <#else>
      <#assign fullName = user.username!>
  </#if>
  ${fullName}
</#macro>
