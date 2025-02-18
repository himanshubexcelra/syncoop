import { 
    getUsers, 
    createUser, 
    editUser, 
    getUserModulePermissions, 
    deleteUserData, 
    getUserEnabled 
} from '../service';
global.fetch = jest.fn(); // Mock global fetch

describe("User Service Test Case", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getUsers should fetch user data successfully", async () => {
        const mockResponse = { users: [{ id: 1, name: "John Doe" }] };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getUsers(["profile"], "admin", 1, 100);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ method: "GET" }));
        expect(result).toEqual(mockResponse);
    });

    test("createUser should create a new user and return response", async () => {
        const formData = new FormData();
        formData.append("name", "Library Manager");

        const mockResponse = { id: 1, name: "Library Manager" };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await createUser(formData);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "POST" }));
        expect(result).toEqual({ status: 200, data: mockResponse });
    });

    test("editUser should edit user and return response", async () => {
        const formData = { id: 1, name: "John Doe Updated" };
        const mockResponse = { id: 1, name: "John Doe Updated" };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await editUser(formData);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "PUT" }));
        expect(result).toEqual({ status: 200, data: mockResponse });
    });

    test("getUserModulePermissions should fetch module permissions", async () => {
        const userData = { organization_id: 1, roles: [{ id: 2 }] };
        const mockResponse = { permissions: ["read", "write"] };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getUserModulePermissions(userData);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ method: "GET" }));
        expect(result).toEqual({ status: 200, data: mockResponse });
    });

    test("deleteUserData should send DELETE request and return response", async () => {
        const mockResponse = { success: true };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await deleteUserData(1, 2);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ method: "DELETE" }));
        expect(result).toEqual(mockResponse);
    });

    test("getUserEnabled should return user enabled status", async () => {
        const mockResponse = { enabled: true };

        (fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getUserEnabled("123");
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ method: "GET" }));
        expect(result).toEqual(mockResponse);
    });

    
});
