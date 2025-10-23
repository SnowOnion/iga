package main

import (
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// TimeSlot 时间段数据
type TimeSlot struct {
	Name      string `json:"name"`      // 时间段名称
	Reserved  int    `json:"reserved"`  // 预约人数
	Total     int    `json:"total"`     // 总票数
	Remaining int    `json:"remaining"` // 余票
	CheckedIn int    `json:"checkedIn"` // 已核销人数
}

// TicketData 票务数据
type TicketData struct {
	Slots     []TimeSlot `json:"slots"`
	StartTime time.Time  `json:"-"` // 开始时间
	ResetIP   string     `json:"-"` // 重置操作的IP
	mu        sync.RWMutex
}

var ticketData = &TicketData{
	Slots: []TimeSlot{
		{Name: "9:00—13:00", Reserved: 0, Total: 100, Remaining: 100, CheckedIn: 0},
		{Name: "13:00—17:00", Reserved: 0, Total: 100, Remaining: 100, CheckedIn: 0},
		{Name: "17:00—20:00", Reserved: 0, Total: 100, Remaining: 100, CheckedIn: 0},
	},
	StartTime: time.Now(),
}

// ValidationError 验证错误详情
type ValidationError struct {
	SlotIndex int    `json:"slotIndex"` // 时段索引
	SlotName  string `json:"slotName"`  // 时段名称
	Message   string `json:"message"`   // 错误信息
	Expected  int    `json:"expected"`  // 期望值
	Actual    int    `json:"actual"`    // 实际值
}

// ErrorResponse 错误响应
type ErrorResponse struct {
	Error  string            `json:"error"`  // 错误摘要
	Errors []ValidationError `json:"errors"` // 详细错误列表
	Slots  []TimeSlot        `json:"slots"`  // 当前实际数据
}

// UpdateRemainingRequest 更新余票请求
type UpdateRemainingRequest struct {
	Remaining []int `json:"remaining"` // 三个时段的余票数
}

// UpdateTotalRequest 更新总票数请求
type UpdateTotalRequest struct {
	Total []int `json:"total"` // 三个时段的总票数
}

func main() {
	// 启动后台任务，模拟预约人数增长
	go simulateReservations()

	r := gin.Default()

	// 配置 CORS
	r.Use(cors.Default())

	// 静态文件服务
	r.Static("/static", "./static")
	r.StaticFile("/", "./static/index.html")

	// API 路由
	api := r.Group("/api")
	{
		// 接口 1: 获取当前数据
		api.GET("/tickets", getTickets)
		// 接口 2: 更新余票
		api.POST("/tickets/remaining", updateRemaining)
		// 接口 3: 更新总票数
		api.POST("/tickets/total", updateTotal)
		// 接口 4: 重置数据
		api.POST("/tickets/reset", resetTickets)
	}

	err := r.Run(":8601")
	if err != nil {
		panic(err)
	}
}

// getTickets 获取当前票务数据
func getTickets(c *gin.Context) {
	ticketData.mu.RLock()
	defer ticketData.mu.RUnlock()

	duration := int(time.Since(ticketData.StartTime).Seconds())
	startTimeMs := ticketData.StartTime.UnixMilli()
	startTimeStr := ticketData.StartTime.Format("2006-01-02 15:04:05")
	c.JSON(http.StatusOK, gin.H{
		"slots":        ticketData.Slots,
		"duration":     duration,     // 已开始模拟时长（秒）
		"startTimeMs":  startTimeMs,  // 开始时间戳（毫秒）
		"startTimeStr": startTimeStr, // 开始时间字符串
	})
}

// updateRemaining 更新余票
func updateRemaining(c *gin.Context) {
	var req UpdateRemainingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	if len(req.Remaining) != 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "必须提供三个时段的余票数"})
		return
	}

	ticketData.mu.Lock()
	defer ticketData.mu.Unlock()

	// 验证余票数必须 >= 0
	var validationErrors []ValidationError
	for i, remaining := range req.Remaining {
		if remaining < 0 {
			validationErrors = append(validationErrors, ValidationError{
				SlotIndex: i,
				SlotName:  ticketData.Slots[i].Name,
				Message:   "余票数不能为负数",
				Expected:  0,
				Actual:    remaining,
			})
		}
	}

	if len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:  "余票数验证失败",
			Errors: validationErrors,
			Slots:  ticketData.Slots,
		})
		return
	}

	// 更新总票数 = 预约人数 + 余票
	for i, remaining := range req.Remaining {
		ticketData.Slots[i].Total = ticketData.Slots[i].Reserved + remaining
		ticketData.Slots[i].Remaining = remaining
	}

	duration := int(time.Since(ticketData.StartTime).Seconds())
	startTimeMs := ticketData.StartTime.UnixMilli()
	c.JSON(http.StatusOK, gin.H{
		"slots":       ticketData.Slots,
		"duration":    duration,
		"startTimeMs": startTimeMs,
	})
}

// updateTotal 更新总票数
func updateTotal(c *gin.Context) {
	var req UpdateTotalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	if len(req.Total) != 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "必须提供三个时段的总票数"})
		return
	}

	ticketData.mu.Lock()
	defer ticketData.mu.Unlock()

	// 验证总票数必须 >= 预约人数
	var validationErrors []ValidationError
	for i, total := range req.Total {
		if total < ticketData.Slots[i].Reserved {
			validationErrors = append(validationErrors, ValidationError{
				SlotIndex: i,
				SlotName:  ticketData.Slots[i].Name,
				Message:   "总票数不能小于预约人数",
				Expected:  ticketData.Slots[i].Reserved,
				Actual:    total,
			})
		}
	}

	if len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:  "总票数验证失败",
			Errors: validationErrors,
			Slots:  ticketData.Slots,
		})
		return
	}

	// 更新总票数和余票
	for i, total := range req.Total {
		ticketData.Slots[i].Total = total
		ticketData.Slots[i].Remaining = total - ticketData.Slots[i].Reserved
	}

	duration := int(time.Since(ticketData.StartTime).Seconds())
	startTimeMs := ticketData.StartTime.UnixMilli()
	c.JSON(http.StatusOK, gin.H{
		"slots":       ticketData.Slots,
		"duration":    duration,
		"startTimeMs": startTimeMs,
	})
}

// resetTickets 重置票务数据
func resetTickets(c *gin.Context) {
	ticketData.mu.Lock()
	defer ticketData.mu.Unlock()

	// 重置所有时段数据
	ticketData.Slots = []TimeSlot{
		{Name: "9:00—13:00", Reserved: 0, Total: 100, Remaining: 100, CheckedIn: 0},
		{Name: "13:00—17:00", Reserved: 0, Total: 100, Remaining: 100, CheckedIn: 0},
		{Name: "17:00—20:00", Reserved: 0, Total: 100, Remaining: 100, CheckedIn: 0},
	}
	// 重置开始时间
	ticketData.StartTime = time.Now()
	// 记录客户端IP
	ticketData.ResetIP = c.ClientIP()

	c.JSON(http.StatusOK, gin.H{
		"slots":        ticketData.Slots,
		"duration":     0,
		"startTimeMs":  ticketData.StartTime.UnixMilli(),
		"startTimeStr": ticketData.StartTime.Format("2006-01-02 15:04:05"),
	})
}

// simulateReservations 模拟预约人数增长
func simulateReservations() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		ticketData.mu.Lock()
		for i := range ticketData.Slots {
			slot := &ticketData.Slots[i]
			if slot.Reserved < slot.Total {
				// 随机变化 -2~3 个预约，但不能掉到负数，也不能超总票数
				change := rand.Intn(6) - 2
				newReserved := slot.Reserved + change
				if newReserved < 0 {
					newReserved = 0
				}
				if newReserved > slot.Total {
					newReserved = slot.Total
				}
				slot.Reserved = newReserved
				slot.Remaining = slot.Total - slot.Reserved
			}
		}
		ticketData.mu.Unlock()
	}
}
