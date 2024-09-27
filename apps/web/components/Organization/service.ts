"use server";

export async function getOrganization() {
  const response = await fetch(`${process.env.API_HOST_URL}/v1/organization`, {
    mode: "no-cors",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}

export async function editOrganization() {
}

export async function createOrganizationApi(formData: FormData) {
  try {
    const response: any = await fetch(
      `${process.env.API_HOST_URL}/v1/organization`,
      {
        mode: "no-cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else if (response.status === 500) {
      const error = await response.json();
      return {status: response.status, error};
    }
  } catch (error: any) {
    return error;
  }
}

export async function deleteOrganization() {
  // console.log(id);
}
