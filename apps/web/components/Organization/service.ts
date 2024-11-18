/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

export async function getOrganization(
  { withRelation = [],
    withCount = [],
    type = ''
  }: {
    withRelation?: string[],
    withCount?: string[],
    type?: string
  }) {
  const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/organization`);
  if (withRelation.length) {
    url.searchParams.append('with', JSON.stringify(withRelation));
  }
  if (withCount.length) {
    url.searchParams.append('withCount', JSON.stringify(withCount));
  }
  if (type) {
    url.searchParams.append('type', type);

  }
  const response = await fetch(url, {
    mode: "no-cors",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}

export async function getOrganizationById(
  {
    withRelation = [],
    id
  }: {
    withRelation?: string[],
    id?: number
  }) {
  const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/organization?id=${id}`);
  if (withRelation.length) {
    url.searchParams.append('with', JSON.stringify(withRelation));
  }
  const response = await fetch(url, {
    mode: "no-cors",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}

export async function editOrganization(formData: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_API_HOST_URL}/v1/organization/`,
      {
        // mode: "no-cors",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      return { status: response.status, error };
    }
  } catch (error: any) {
    console.error('error', error)
    return error;
  }
}

export async function createOrganization(formData: FormData, role_id: number) {
  try {
    const response: any = await fetch(
      `${process.env.NEXT_API_HOST_URL}/v1/organization`,
      {
        mode: "no-cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role_id: role_id }),
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else if (response.status === 500) {
      const error = await response.json();
      return { status: response.status, error };
    }
  } catch (error: any) {
    return error;
  }
}

