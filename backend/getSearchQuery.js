module.exports = {
    // Build query for MongoDB based on user preferences.
    getSearchQuery : async (filterData, preferences) => {
        // If no preferences, just filter by user input.
        if (preferences.length === 0) {
            const query = {
                $and: Object.keys(filterData).map((field) => {
                    if (field === "Price") {
                        return {
                            [field]: filterData.Price,
                        };
                    }
                    return {
                        [field]: { $regex: filterData[field], $options: "i" },
                    };
                }),
            }
            return query;
        } else {
            // If preferences, filter by user input and preferences.
            const query = {
                $and: [
                    {
                        $or: preferences.map((term) => ({
                            "DietaryRestrictions": { $regex: term, $options: "i" }
                        }))
                    },
                    {
                        $and: Object.keys(filterData).map((field) => {
                            if (field === "Price") {
                                return {
                                    [field]: filterData.Price,
                                };
                            }
                            return {
                                [field]: { $regex: filterData[field], $options: "i" },
                            };
                        }),
                    },
                ],
            };
            return query;
        }
    }
}