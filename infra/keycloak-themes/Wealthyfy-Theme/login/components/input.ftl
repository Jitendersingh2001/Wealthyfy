<#-- input.ftl -->
<#macro inputField id label type="text" placeholder="" value="" required=false icon="">
  <div class="mb-3">
    <label for="${id}" class="form-label fw-semibold text-capitalize">${label}
      <#if required><span class="text-danger">*</span></#if>
    </label>
    <div class="input-group">
      <#if icon?has_content>
        <span class="input-group-text bg-light">
          <i class="${icon}"></i>
        </span>
      </#if>
      <input
        type="${type}"
        id="${id}"
        name="${id}"
        class="form-control"
        placeholder="${placeholder}"
        value="${value}"
        <#if required>required</#if>
      />
    </div>
  </div>
</#macro>
